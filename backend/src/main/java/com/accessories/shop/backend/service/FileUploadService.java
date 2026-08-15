package com.accessories.shop.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    @SuppressWarnings("rawtypes")
    public String uploadFile(MultipartFile multipartFile) throws IOException {
        String originalFilename = multipartFile.getOriginalFilename();
        String publicId = UUID.randomUUID() + (originalFilename != null ? "_" + originalFilename : "");
        
        Map uploadResult = cloudinary.uploader().upload(multipartFile.getBytes(), 
                ObjectUtils.asMap("public_id", publicId));
                
        return uploadResult.get("url").toString();
    }
}
