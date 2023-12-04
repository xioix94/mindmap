package com.example.mindmap.service;

import com.example.mindmap.model.Users;
import com.example.mindmap.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UsersRepository usersRepository;

    @Autowired
    public UserService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public Users getUserById(long userId) {
        return usersRepository.findById(userId);
    }

    public Users createUser(Users users) {
        // 추가적인 유효성 검사 또는 로직을 구현할 수 있음
        return usersRepository.save(users);
    }

    public void deleteUser(long userId) {
        usersRepository.deleteById(userId);
    }
}