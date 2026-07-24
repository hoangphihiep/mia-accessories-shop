package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.SiteSetting;
import com.accessories.shop.backend.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.accessories.shop.backend.exception.BadRequestException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository siteSettingRepository;

    private static final Set<String> ALLOWED_KEYS = Set.of(
            "HERO_TITLE", "HERO_SUBTITLE", "HERO_BG_IMAGE",
            "NEWSLETTER_TITLE", "NEWSLETTER_DESC",
            "TRUST_1_TITLE", "TRUST_1_DESC",
            "TRUST_2_TITLE", "TRUST_2_DESC",
            "TRUST_3_TITLE", "TRUST_3_DESC",
            "TRUST_4_TITLE", "TRUST_4_DESC",
            "BENTO_1_TITLE", "BENTO_1_SUBTITLE", "BENTO_1_IMAGE", "BENTO_1_LINK",
            "BENTO_2_TITLE", "BENTO_2_SUBTITLE", "BENTO_2_IMAGE", "BENTO_2_LINK",
            "SHIPPING_FEE_DEFAULT", "FREE_SHIPPING_THRESHOLD"
    );

    public Map<String, String> getAllSettings() {
        return siteSettingRepository.findAll().stream()
                .collect(Collectors.toMap(
                        SiteSetting::getSettingKey, 
                        s -> s.getSettingValue() != null ? s.getSettingValue() : ""
                ));
    }

    @Transactional
    public void updateSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> {
            if (!ALLOWED_KEYS.contains(key)) {
                throw new BadRequestException("Khóa cấu hình không hợp lệ: " + key);
            }
        });

        List<SiteSetting> existingSettings = siteSettingRepository.findAllById(settings.keySet());
        Map<String, SiteSetting> existingSettingsMap = existingSettings.stream()
                .collect(Collectors.toMap(SiteSetting::getSettingKey, s -> s));

        List<SiteSetting> settingsToSave = new ArrayList<>();
        settings.forEach((key, value) -> {
            SiteSetting setting = existingSettingsMap.getOrDefault(key,
                    SiteSetting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            settingsToSave.add(setting);
        });

        siteSettingRepository.saveAll(settingsToSave);
    }
}
