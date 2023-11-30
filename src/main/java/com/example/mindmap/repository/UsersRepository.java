package com.example.mindmap.repository;

import com.example.mindmap.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.ArrayList;

public interface UsersRepository extends JpaRepository<Users, Long> {
    // User 엔터티에 특화된 메서드 추가 가능
    Users findByEmail(String email);

    ArrayList findAll();

    Users findById(long id);

    Users save(Users users);

    void deleteById(long id);
}