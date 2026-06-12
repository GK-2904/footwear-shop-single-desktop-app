package com.footwearshop.launcher;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public final class BackendProcess {

    private final InstallPaths paths;
    private Process process;

    public BackendProcess(InstallPaths paths) {
        this.paths = paths;
    }

    public void start() throws IOException {
        if (process != null && process.isAlive()) {
            return;
        }

        Path javaExe = paths.resolveJavaExecutable();
        Path backendJar = paths.backendJar();

        if (!Files.exists(backendJar)) {
            throw new IOException("Backend JAR not found: " + backendJar);
        }

        paths.ensureDataFolders();

        List<String> command = new ArrayList<>();
        command.add(javaExe.toString());
        command.add("-jar");
        command.add(backendJar.toString());
        command.add("--spring.profiles.active=desktop");

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(paths.installDir().toFile());
        builder.redirectErrorStream(true);

        Path logFile = paths.dataDir().resolve("backend-startup.log");
        if (Files.exists(paths.dataDir()) || paths.dataDir().getParent() != null) {
            builder.redirectOutput(ProcessBuilder.Redirect.appendTo(logFile.toFile()));
        }

        process = builder.start();
    }

    public void stop() {
        if (process == null) {
            return;
        }
        if (process.isAlive()) {
            process.destroy();
            try {
                if (!process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
            }
        }
        process = null;
    }
}
