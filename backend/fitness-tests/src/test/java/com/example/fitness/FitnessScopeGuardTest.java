package com.example.fitness;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/**
 * Scope guard: the {@code *-api} set that fitness-tests depends on MUST equal the {@code *-api} set
 * registered in settings.gradle.
 *
 * <p>Without it, a newly added {@code *-api} module would not land on ArchLawsTest's classpath —
 * ArchUnit would silently not scan it and the gate would be a no-op. This test parses both build
 * files and compares the two sets; a mismatch fails with the fix.
 */
class FitnessScopeGuardTest {

    /** settings.gradle api registration: include 'xxx-api'. */
    private static final Pattern SETTINGS_API_INCLUDE =
            Pattern.compile("^\\s*include\\s+'([^']*-api)'", Pattern.MULTILINE);

    /** fitness-tests/build.gradle api dependency: testImplementation project(':xxx-api'). */
    private static final Pattern FITNESS_API_DEP =
            Pattern.compile("testImplementation\\s+project\\('(:[^']*-api)'\\)");

    @Test
    void fitnessTestsMustDependOnEveryRegisteredApiModule() throws IOException {
        Path repoRoot = findRepoRoot();
        Set<String> registered = extract(
                Files.readString(repoRoot.resolve("settings.gradle")), SETTINGS_API_INCLUDE, false);
        Set<String> scanned = extract(
                Files.readString(repoRoot.resolve("fitness-tests/build.gradle")), FITNESS_API_DEP, true);

        assertFalse(registered.isEmpty(), "settings.gradle parsed no *-api include — fix the guard regex first");
        assertEquals(registered, scanned,
                "fitness-tests *-api scan set differs from settings.gradle registration."
                        + "\n  settings.gradle registered: " + registered
                        + "\n  fitness-tests depends on:   " + scanned
                        + "\nFix: for every include 'xxx-api' in settings.gradle, add "
                        + "testImplementation project(':xxx-api') to fitness-tests/build.gradle so "
                        + "ArchLawsTest scans it (otherwise that api silently escapes the gate).");
    }

    private static Path findRepoRoot() {
        Path dir = Path.of("").toAbsolutePath();
        while (dir != null && !Files.exists(dir.resolve("settings.gradle"))) {
            dir = dir.getParent();
        }
        if (dir == null) {
            throw new IllegalStateException("settings.gradle not found walking up from " + Path.of("").toAbsolutePath());
        }
        return dir;
    }

    /** Extract matches and normalize to 'xxx-api' form (strip the dependency-notation leading colon). */
    private static Set<String> extract(String content, Pattern pattern, boolean stripLeadingColon) {
        Set<String> result = new TreeSet<>();
        Matcher m = pattern.matcher(content);
        while (m.find()) {
            String path = m.group(1);
            result.add(stripLeadingColon && path.startsWith(":") ? path.substring(1) : path);
        }
        return result;
    }
}
