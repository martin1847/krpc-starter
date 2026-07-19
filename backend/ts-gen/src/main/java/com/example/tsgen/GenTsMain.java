package com.example.tsgen;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import tech.krpc.ext.gen.Gen;

/**
 * @starter/api-client TS generation entry point (built on krpc's real generator, ext-rpc-gen).
 *
 * <p>{@code Gen} has no main and its {@code basePkg} is a public static field (default com.zlkj) —
 * override it to this project's root, then call {@code Gen.genTypescript(app, outFolder)}. The
 * generator scans {@code basePkg} for {@code @UnsafeWeb @RpcService} interfaces (the frontend-facing
 * services) and emits class-based {@code *-service.ts} + DTOs importing 'krpc-base' / 'class-validator'.
 *
 * <p>args[0]=appName (default bookshelf-server, matches rpc.server.app / the call path segment);
 * args[1]=output dir.
 *
 * <p>Two post-normalizations keep the output tsc-compilable WITHOUT touching the *-api contract:
 * <ol>
 *   <li>The generator maps only boxed types; bare Java numeric primitives (int/long/…) are emitted
 *       verbatim as illegal TS — rewrite them to {@code number}.</li>
 *   <li>The generator skips zero-field DTOs (e.g. a no-arg request), leaving the service file
 *       referencing an undeclared type — emit the missing empty class + fix the import.</li>
 * </ol>
 */
public final class GenTsMain {

    private GenTsMain() {
    }

    public static void main(String[] args) {
        String app = args.length > 0 ? args[0] : "bookshelf-server";
        File outDir = new File(args.length > 1 ? args[1] : "build/generated-ts/src");
        outDir.mkdirs();

        Gen.basePkg = "com.example";
        Gen.genTypescript(app, outDir);
        normalizeNumericPrimitives(outDir);
        emitMissingEmptyDtos(outDir);

        System.out.println("[genTs] done: app=" + app + " basePkg=" + Gen.basePkg
                + " out=" + outDir.getAbsolutePath());
    }

    /** Rewrite Java numeric primitives (int/long/short/byte/float/double) in type position to TS number. */
    static void normalizeNumericPrimitives(File dir) {
        File[] files = dir.listFiles((d, n) -> n.endsWith(".ts"));
        if (files == null) {
            return;
        }
        for (File f : files) {
            try {
                String src = Files.readString(f.toPath(), StandardCharsets.UTF_8);
                String fixed = src.replaceAll("(:\\s*)(?:int|long|short|byte|float|double)\\b", "$1number");
                if (!fixed.equals(src)) {
                    Files.writeString(f.toPath(), fixed, StandardCharsets.UTF_8);
                    System.out.println("[genTs] normalized numeric primitives in " + f.getName());
                }
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    private static final Pattern PARAM_TYPE = Pattern.compile("\\(\\s*d\\s*:\\s*([A-Za-z_][A-Za-z0-9_]*)");
    private static final Pattern DTO_IMPORT = Pattern.compile(
            "import\\s+type\\s*\\{([^}]*)\\}\\s*from\\s*'\\./([A-Za-z0-9_-]+)'\\s*;");

    /**
     * Local patch for ext-rpc-gen's zero-field-DTO gap (removable once fixed upstream): the generator
     * skips zero-field DTOs, so a service file references an undeclared type. Detect "referenced but
     * not declared", append an empty class to the dto file, and add the name to the import. Idempotent.
     */
    static void emitMissingEmptyDtos(File dir) {
        File[] files = dir.listFiles((d, n) -> n.endsWith("-service.ts"));
        if (files == null) {
            return;
        }
        for (File serviceFile : files) {
            try {
                String serviceSrc = Files.readString(serviceFile.toPath(), StandardCharsets.UTF_8);

                Matcher importMatcher = DTO_IMPORT.matcher(serviceSrc);
                if (!importMatcher.find()) {
                    continue;
                }
                String declaredNames = importMatcher.group(1);
                String dtoBaseName = importMatcher.group(2);

                File dtoFile = new File(dir, dtoBaseName + ".ts");
                if (!dtoFile.exists()) {
                    continue;
                }
                String dtoSrc = Files.readString(dtoFile.toPath(), StandardCharsets.UTF_8);

                Set<String> missing = new LinkedHashSet<>();
                Matcher paramMatcher = PARAM_TYPE.matcher(serviceSrc);
                while (paramMatcher.find()) {
                    String name = paramMatcher.group(1);
                    boolean declared = Pattern.compile(
                            "export\\s+(?:class|interface)\\s+" + Pattern.quote(name) + "\\b")
                            .matcher(dtoSrc).find();
                    if (!declared) {
                        missing.add(name);
                    }
                }
                if (missing.isEmpty()) {
                    continue;
                }

                StringBuilder appended = new StringBuilder(dtoSrc);
                if (appended.length() > 0 && appended.charAt(appended.length() - 1) != '\n') {
                    appended.append('\n');
                }
                for (String name : missing) {
                    appended.append("\nexport class  ").append(name).append(" {\n}\n");
                }
                Files.writeString(dtoFile.toPath(), appended.toString(), StandardCharsets.UTF_8);

                String newDeclared = appendImportNames(declaredNames, missing);
                String newImportLine = "import type {" + newDeclared + "} from './" + dtoBaseName + "';";
                String newServiceSrc = serviceSrc.substring(0, importMatcher.start())
                        + newImportLine
                        + serviceSrc.substring(importMatcher.end());
                Files.writeString(serviceFile.toPath(), newServiceSrc, StandardCharsets.UTF_8);

                System.out.println("[genTs] emitted " + missing.size()
                        + " empty DTO(s) for " + serviceFile.getName() + ": " + missing);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    private static String appendImportNames(String declaredNames, Set<String> missing) {
        String trimmed = declaredNames.trim();
        StringBuilder sb = new StringBuilder(" ");
        if (!trimmed.isEmpty()) {
            sb.append(trimmed);
        }
        for (String name : missing) {
            if (sb.length() > 1) {
                sb.append(", ");
            }
            sb.append(name);
        }
        sb.append(' ');
        return sb.toString();
    }
}
