package com.footwearshop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/backup")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8080"})
public class BackupController {

    private static final Path DATA_DIR = Path.of("data");
    private static final Path BACKUP_DIR = Path.of("backups");
    private static final String DB_PREFIX = "shivam-footwear";

    @PostMapping
    public ResponseEntity<?> createBackup() {
        try {
            Files.createDirectories(BACKUP_DIR);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
            String backupName = "shivam-backup-" + timestamp;

            List<String> copied = new ArrayList<>();
            if (Files.exists(DATA_DIR)) {
                try (var stream = Files.list(DATA_DIR)) {
                    stream.filter(p -> p.getFileName().toString().startsWith(DB_PREFIX))
                            .forEach(dbFile -> {
                                try {
                                    Path dest = BACKUP_DIR.resolve(backupName + dbFile.getFileName().toString().substring(DB_PREFIX.length()));
                                    Files.copy(dbFile, dest, StandardCopyOption.REPLACE_EXISTING);
                                    copied.add(dest.getFileName().toString());
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            });
                }
            }

            Path shopSettings = DATA_DIR.resolve("shop.properties");
            if (Files.exists(shopSettings)) {
                Path dest = BACKUP_DIR.resolve(backupName + "-shop.properties");
                Files.copy(shopSettings, dest, StandardCopyOption.REPLACE_EXISTING);
                copied.add(dest.getFileName().toString());
            }

            if (copied.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No database files found to backup"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Backup created successfully",
                    "files", copied
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listBackups() {
        try {
            if (!Files.exists(BACKUP_DIR)) {
                return ResponseEntity.ok(List.of());
            }
            List<String> backups = new ArrayList<>();
            try (var stream = Files.list(BACKUP_DIR)) {
                stream.filter(p -> p.getFileName().toString().startsWith("shivam-backup-"))
                        .map(p -> p.getFileName().toString())
                        .sorted(Comparator.reverseOrder())
                        .forEach(backups::add);
            }
            return ResponseEntity.ok(backups);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/info")
    public ResponseEntity<?> dataInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("dataPath", DATA_DIR.toAbsolutePath().toString());
        info.put("backupPath", BACKUP_DIR.toAbsolutePath().toString());
        info.put("databaseExists", Files.exists(DATA_DIR.resolve(DB_PREFIX + ".mv.db")));
        return ResponseEntity.ok(info);
    }
}
