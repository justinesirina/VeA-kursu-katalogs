package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.RoleKey;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleAccessCheckerTest {

    @Mock UserRepository userRepository;
    @InjectMocks RoleAccessChecker checker;

    private User userWithRole(int id, RoleKey roleKey, boolean active) {
        UserRole role = new UserRole();
        role.setId(99);
        role.setRoleKey(roleKey);
        User u = new User();
        u.setId(id);
        u.setRole(role);
        u.setActive(active);
        return u;
    }

    @Test
    void nullActor_isNotStaff() {
        assertFalse(checker.isStaff(null));
    }

    @Test
    void unknownUser_isNotStaff() {
        when(userRepository.findById(42)).thenReturn(Optional.empty());
        assertFalse(checker.isStaff(42));
    }

    @Test
    void inactiveUser_isNotStaff() {
        User u = userWithRole(1, RoleKey.TEACHER, false);
        when(userRepository.findById(1)).thenReturn(Optional.of(u));
        assertFalse(checker.isStaff(1));
    }

    @Test
    void student_isNotStaff() {
        User u = userWithRole(2, RoleKey.STUDENT, true);
        when(userRepository.findById(2)).thenReturn(Optional.of(u));
        assertFalse(checker.isStaff(2));
    }

    @Test
    void teacher_isStaff() {
        User u = userWithRole(3, RoleKey.TEACHER, true);
        when(userRepository.findById(3)).thenReturn(Optional.of(u));
        assertTrue(checker.isStaff(3));
    }

    @Test
    void programDirector_isStaff() {
        User u = userWithRole(4, RoleKey.PROGRAM_DIRECTOR, true);
        when(userRepository.findById(4)).thenReturn(Optional.of(u));
        assertTrue(checker.isStaff(4));
    }

    @Test
    void administrator_isStaff() {
        User u = userWithRole(5, RoleKey.ADMIN, true);
        when(userRepository.findById(5)).thenReturn(Optional.of(u));
        assertTrue(checker.isStaff(5));
    }

    @Test
    void systemAdministrator_isStaff() {
        User u = userWithRole(6, RoleKey.SYSTEM_ADMIN, true);
        when(userRepository.findById(6)).thenReturn(Optional.of(u));
        assertTrue(checker.isStaff(6));
    }
}
