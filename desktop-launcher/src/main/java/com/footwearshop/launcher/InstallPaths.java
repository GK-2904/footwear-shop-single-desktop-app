package com.footwearshop.launcher;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class InstallPaths {

    private final Path installDir;

    public InstallPaths() {
        this.installDir = resolveInstallDir();
    }

    public Path installDir() {
        return installDir;
    }

    public Path backendJar() {
        return installDir.resolve("app").resolve("footwear-backend.jar");
    }

    public Path dataDir() {
        return installDir.resolve("data");
    }

    public Path backupsDir() {
        return installDir.resolve("backups");
    }

    public Path resolveJavaExecutable() {
        String javaHome = System.getProperty("java.home");
        if (javaHome != null && !javaHome.isBlank()) {
            Path runtimeJava = Paths.get(javaHome, "bin", "java.exe");
            if (Files.exists(runtimeJava)) {
                return runtimeJava;
            }
        }

        Path jreJava = installDir.resolve("jre").resolve("bin").resolve("java.exe");
        if (Files.exists(jreJava)) {
            return jreJava;
        }

        Path installRuntimeJava = installDir.resolve("runtime").resolve("bin").resolve("java.exe");
        if (Files.exists(installRuntimeJava)) {
            return installRuntimeJava;
        }

        String javaHomeEnv = System.getenv("JAVA_HOME");
        if (javaHomeEnv != null && !javaHomeEnv.isBlank()) {
            Path envJava = Paths.get(javaHomeEnv, "bin", "java.exe");
            if (Files.exists(envJava)) {
                return envJava;
            }
        }
        return Path.of("java");
    }

    public void ensureDataFolders() throws IOException {
        Files.createDirectories(dataDir());
        Files.createDirectories(backupsDir());
    }

    private static Path resolveInstallDir() {
        String jpackagePath = System.getProperty("jpackage.app-path");
        if (jpackagePath != null && !jpackagePath.isBlank()) {
            Path installRoot = normalizeInstallRoot(Paths.get(jpackagePath));
            if (hasBackendJar(installRoot)) {
                return installRoot;
            }
        }

        String appDir = System.getProperty("shivam.install.dir");
        if (appDir != null && !appDir.isBlank()) {
            return normalizeInstallRoot(Paths.get(appDir));
        }

        Path userDir = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
        if (Files.exists(userDir.resolve("app").resolve("footwear-backend.jar"))) {
            return userDir;
        }

        Path codeSource = resolveCodeSourcePath();

        if (codeSource != null && codeSource.toString().endsWith(".jar")) {
            Path parent = codeSource.getParent();
            if (parent != null && "app".equals(parent.getFileName().toString())) {
                return parent.getParent();
            }
            return parent != null ? parent : Paths.get(".").toAbsolutePath().normalize();
        }

        Path cwd = Paths.get("").toAbsolutePath().normalize();
        if (Files.exists(cwd.resolve("app").resolve("footwear-backend.jar"))) {
            return cwd;
        }

        Path desktopPackage = cwd.resolve("desktop").resolve("ShivamFootwear");
        if (Files.exists(desktopPackage.resolve("app").resolve("footwear-backend.jar"))) {
            return desktopPackage;
        }

        Path desktopAppImage = cwd.resolve("desktop").resolve("ShivamFootwear-App");
        if (Files.exists(desktopAppImage.resolve("app").resolve("footwear-backend.jar"))) {
            return desktopAppImage;
        }

        return cwd;
    }

    private static Path normalizeInstallRoot(Path path) {
        Path normalized = path.toAbsolutePath().normalize();
        if (Files.isRegularFile(normalized)) {
            Path parent = normalized.getParent();
            if (parent != null) {
                normalized = parent;
            }
        }
        return normalized;
    }

    private static boolean hasBackendJar(Path installRoot) {
        return Files.exists(installRoot.resolve("app").resolve("footwear-backend.jar"));
    }

    private static Path resolveCodeSourcePath() {
        try {
            URL location = InstallPaths.class.getProtectionDomain().getCodeSource().getLocation();
            if (location == null) {
                return null;
            }
            return Paths.get(location.toURI());
        } catch (URISyntaxException | IllegalArgumentException ex) {
            return null;
        }
    }
}
