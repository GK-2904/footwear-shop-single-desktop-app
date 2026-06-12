package com.footwearshop.controller;

import com.footwearshop.dto.ShopSettingsDto;
import com.footwearshop.service.ShopSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8080"})
public class SettingsController {

    private final ShopSettingsService shopSettingsService;

    public SettingsController(ShopSettingsService shopSettingsService) {
        this.shopSettingsService = shopSettingsService;
    }

    @GetMapping
    public ShopSettingsDto getSettings() {
        return shopSettingsService.getSettings();
    }

    @PutMapping
    public ResponseEntity<?> saveSettings(@RequestBody ShopSettingsDto dto) {
        try {
            return ResponseEntity.ok(shopSettingsService.saveSettings(dto));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save settings"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        if (pin != null && shopSettingsService.validatePin(pin)) {
            return ResponseEntity.ok(Map.of("success", true, "name", shopSettingsService.getSettings().getName()));
        }
        return ResponseEntity.status(401).body(Map.of("success", false, "error", "Invalid PIN"));
    }
}
