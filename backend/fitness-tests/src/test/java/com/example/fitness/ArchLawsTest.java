package com.example.fitness;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.fields;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaField;
import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.core.domain.JavaType;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Architecture fitness gate — three whole-stack laws, enforced statically over the {@code *-api}
 * contract bytecode. Every rule fails this repo's build with a message that says how to fix it.
 *
 * <ul>
 *   <li><b>R1 — boxed DTO fields.</b> {@code *-api} DTO fields must be boxed
 *       (Integer/Long/Boolean...), never primitives: krpc serializes JSON as NON_NULL, so a
 *       primitive defaults to 0/false and cannot express "absent".</li>
 *   <li><b>R2 — no floating-point money.</b> No field type or method-signature type in {@code *-api}
 *       (including generic arguments and array elements) may be float/double/Float/Double/BigDecimal.
 *       Money is integer minor units (e.g. Integer/Long cents); floats never enter a money contract.</li>
 *   <li><b>R3 — api ⊥ server.</b> The {@code *-api} contract must not depend on any {@code *-server}
 *       implementation package (dependency inversion: server depends on api, never the reverse).</li>
 * </ul>
 *
 * <p>Negative probe: change {@code Integer priceCents} in BookDetail to {@code double price} and both
 * R1 and R2 go red; revert and they go green. That is how you prove the gate is actually wired.
 *
 * <p>The scanned {@code *-api} set is kept in sync with settings.gradle by {@link FitnessScopeGuardTest}.
 */
class ArchLawsTest {

    /** This repo's contract layer. */
    private static final String API_PACKAGES = "com.example..api..";
    /** This repo's implementation layer. */
    private static final String SERVER_PACKAGES = "com.example..server..";

    /** Floating-point / arbitrary-precision types forbidden anywhere in the contract. */
    private static final Set<String> FORBIDDEN_TYPES = Set.of(
            "float", "double", "java.lang.Float", "java.lang.Double", "java.math.BigDecimal");

    /** All compiled contract classes (each *-api put on the classpath by build.gradle). */
    private static final JavaClasses API_CLASSES =
            new ClassFileImporter().importPackages("com.example");

    // ── R1: DTO fields must be boxed, not primitive ──────────────────────────
    @Test
    void r1_apiDtoFieldsMustBeBoxedNotPrimitive() {
        fields().that().areNotStatic()
                .and().areDeclaredInClassesThat().resideInAPackage(API_PACKAGES)
                .should(notBePrimitive())
                .because("[R1] DTO fields must be boxed (Integer/Long/Boolean): a primitive defaults "
                        + "to 0/false and cannot express 'absent' under NON_NULL JSON.")
                .check(API_CLASSES);
    }

    // ── R2a: field types (incl. generics/arrays) carry no floating/BigDecimal ─
    @Test
    void r2a_apiFieldTypesMustNotCarryFloatingOrBigDecimal() {
        fields().that().areDeclaredInClassesThat().resideInAPackage(API_PACKAGES)
                .should(typeObeyMoneyLaw("field"))
                .because("[R2] money is integer minor units; float/double/Float/Double/BigDecimal "
                        + "never enter the contract (generics/arrays included).")
                .check(API_CLASSES);
    }

    // ── R2b: method signatures (params + return) carry no floating/BigDecimal ─
    @Test
    void r2b_apiMethodSignaturesMustNotCarryFloatingOrBigDecimal() {
        methods().that().areDeclaredInClassesThat().resideInAPackage(API_PACKAGES)
                .should(signatureObeyMoneyLaw())
                .because("[R2] method signatures carry no float/double/Float/Double/BigDecimal "
                        + "(money is integer minor units).")
                .check(API_CLASSES);
    }

    // ── R3: api must not depend on server ────────────────────────────────────
    @Test
    void r3_apiMustNotDependOnServer() {
        noClasses().that().resideInAPackage(API_PACKAGES)
                .should().dependOnClassesThat().resideInAPackage(SERVER_PACKAGES)
                .because("[R3] the *-api contract is the single source of truth and must not depend "
                        + "on any *-server implementation package (server depends on api, never reverse).")
                .check(API_CLASSES);
    }

    // ── shared money-law decision over one type ──────────────────────────────

    /**
     * getAllInvolvedRawTypes() covers the type plus its generic arguments and array element
     * (List&lt;Double&gt; / Map&lt;String,BigDecimal&gt; / double[] all match).
     */
    private static List<String> moneyLawViolations(JavaType type, String memberDescription) {
        List<String> violations = new ArrayList<>();
        for (JavaClass involved : type.getAllInvolvedRawTypes()) {
            String typeName = involved.getName();
            if (FORBIDDEN_TYPES.contains(typeName)) {
                violations.add("[R2] " + memberDescription + " involves forbidden type '" + typeName
                        + "' (incl. generic arguments / array elements). Money MUST be integer minor "
                        + "units (e.g. Integer/Long cents); float/double/Float/Double/BigDecimal never "
                        + "enter the contract.");
            }
        }
        return violations;
    }

    private static ArchCondition<JavaField> notBePrimitive() {
        return new ArchCondition<>("have a boxed (non-primitive) type") {
            @Override
            public void check(JavaField field, ConditionEvents events) {
                JavaClass type = field.getRawType();
                if (type.isPrimitive()) {
                    events.add(SimpleConditionEvent.violated(field,
                            "[R1] " + field.getFullName() + " uses primitive type '" + type.getName()
                                    + "'. DTO fields MUST be boxed (Integer/Long/Boolean): a primitive "
                                    + "defaults to 0/false and cannot express 'absent'."));
                }
            }
        };
    }

    private static ArchCondition<JavaField> typeObeyMoneyLaw(String kind) {
        return new ArchCondition<>("not carry float/double/Float/Double/BigDecimal") {
            @Override
            public void check(JavaField field, ConditionEvents events) {
                for (String message : moneyLawViolations(field.getType(), field.getFullName())) {
                    events.add(SimpleConditionEvent.violated(field, message));
                }
            }
        };
    }

    private static ArchCondition<JavaMethod> signatureObeyMoneyLaw() {
        return new ArchCondition<>("not carry float/double/Float/Double/BigDecimal in the signature") {
            @Override
            public void check(JavaMethod method, ConditionEvents events) {
                List<JavaType> signatureTypes = new ArrayList<>();
                signatureTypes.add(method.getReturnType());
                signatureTypes.addAll(method.getParameterTypes());
                for (JavaType type : signatureTypes) {
                    for (String message : moneyLawViolations(type,
                            method.getFullName() + " (signature type " + type.getName() + ")")) {
                        events.add(SimpleConditionEvent.violated(method, message));
                    }
                }
            }
        };
    }
}
