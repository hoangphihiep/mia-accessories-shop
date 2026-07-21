package com.accessories.shop.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile multipartFile) throws IOException {
        String originalFilename = multipartFile.getOriginalFilename();
        String publicId = UUID.randomUUID().toString() + (originalFilename != null ? "_" + originalFilename : "");
        
        Map uploadResult = cloudinary.uploader().upload(multipartFile.getBytes(), 
                ObjectUtils.asMap("public_id", publicId));
                
        return uploadResult.get("url").toString();
    }
}
