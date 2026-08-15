package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.SiteSetting;
import com.accessories.shop.backend.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.accessories.shop.backend.exception.BadRequestException;
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
            "SHIPPING_FEE_DEFAULT", "FREE_SHIPPING_THRESHOLD",
            "ABOUT_HERO_BG", "ABOUT_HERO_SUBTITLE", "ABOUT_HERO_TITLE", "ABOUT_HERO_QUOTE",
            "ABOUT_PHIL_SUB", "ABOUT_PHIL_TITLE", "ABOUT_PHIL_DESC1", "ABOUT_PHIL_DESC2",
            "ABOUT_CRAFT_TITLE", "ABOUT_CRAFT_SUB",
            "ABOUT_MAT1_TITLE", "ABOUT_MAT1_DESC",
            "ABOUT_MAT2_TITLE", "ABOUT_MAT2_DESC",
            "ABOUT_MAT3_TITLE", "ABOUT_MAT3_DESC",
            "ABOUT_VALUE_TITLE", "ABOUT_VALUE_DESC",
            "ABOUT_PHIL_IMG", "ABOUT_VALUE_IMG"
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
