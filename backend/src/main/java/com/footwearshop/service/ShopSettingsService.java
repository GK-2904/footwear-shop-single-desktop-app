package com.footwearshop.service;

import com.footwearshop.dto.ShopSettingsDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

@Service
public class ShopSettingsService {

    private static final Path SETTINGS_FILE = Path.of("data", "shop.properties");

    @Value("${shop.name:Shivam Footwear Shop}")
    private String defaultName;

    @Value("${shop.address:Your Shop Address Here}")
    private String defaultAddress;

    @Value("${shop.phone:+91 XXXXXXXXXX}")
    private String defaultPhone;

    @Value("${shop.gstin:}")
    private String defaultGstin;

    @Value("${shop.pin:1234}")
    private String defaultPin;

    public ShopSettingsDto getSettings() {
        Properties props = loadProperties();
        ShopSettingsDto dto = new ShopSettingsDto();
        dto.setName(props.getProperty("shop.name", defaultName));
        dto.setAddress(props.getProperty("shop.address", defaultAddress));
        dto.setPhone(props.getProperty("shop.phone", defaultPhone));
        dto.setGstin(props.getProperty("shop.gstin", defaultGstin));
        dto.setPin(props.getProperty("shop.pin", defaultPin));
        return dto;
    }

    public ShopSettingsDto saveSettings(ShopSettingsDto dto) throws IOException {
        Files.createDirectories(SETTINGS_FILE.getParent());
        Properties props = new Properties();
        props.setProperty("shop.name", dto.getName() != null ? dto.getName() : defaultName);
        props.setProperty("shop.address", dto.getAddress() != null ? dto.getAddress() : defaultAddress);
        props.setProperty("shop.phone", dto.getPhone() != null ? dto.getPhone() : defaultPhone);
        props.setProperty("shop.gstin", dto.getGstin() != null ? dto.getGstin() : "");
        props.setProperty("shop.pin", dto.getPin() != null ? dto.getPin() : defaultPin);
        try (var out = Files.newOutputStream(SETTINGS_FILE)) {
            props.store(out, "Shivam Footwear Shop Settings");
        }
        return getSettings();
    }

    public boolean validatePin(String pin) {
        return getSettings().getPin().equals(pin);
    }

    private Properties loadProperties() {
        Properties props = new Properties();
        if (Files.exists(SETTINGS_FILE)) {
            try (var in = Files.newInputStream(SETTINGS_FILE)) {
                props.load(in);
            } catch (IOException ignored) {
                // use defaults
            }
        }
        return props;
    }
}
