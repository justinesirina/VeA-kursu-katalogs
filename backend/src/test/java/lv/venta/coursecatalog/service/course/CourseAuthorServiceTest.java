package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.user.RoleKey;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Vienības testi {@link CourseAuthorService#create(CourseAuthor)} F1 datu integritātes
 * pārbaudei: kursa autoram jābūt vismaz Pasniedzēja lomai (kumulatīvi ieskaitot
 * Programmas direktoru, Administratoru un Sistēmas administratoru).
 */
@ExtendWith(MockitoExtension.class)
class CourseAuthorServiceTest {

    @Mock CourseAuthorRepository repository;
    @Mock UserRepository userRepository;
    @InjectMocks CourseAuthorService service;

    private CourseAuthor authorWithUserId(Integer userId) {
        CourseAuthor input = new CourseAuthor();
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            input.setUser(user);
        }
        return input;
    }

    private User userWithRoleKey(int id, RoleKey roleKey) {
        UserRole role = new UserRole();
        role.setRoleKey(roleKey);
        User user = new User();
        user.setId(id);
        user.setRole(role);
        return user;
    }

    @Test
    void create_nullInput_throwsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.create(null));
        assertEquals("Kursa autoram/mācībspēkam jānorāda lietotājs.", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void create_inputWithNullUser_throwsIllegalArgument() {
        CourseAuthor input = new CourseAuthor();
        assertThrows(IllegalArgumentException.class, () -> service.create(input));
        verify(repository, never()).save(any());
    }

    @Test
    void create_userNotFoundInRepository_throwsIllegalArgument() {
        CourseAuthor input = authorWithUserId(42);
        when(userRepository.findById(42)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.create(input));
        assertEquals("Norādītais lietotājs nav atrasts sistēmā.", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void create_userWithStudentRole_isRejected() {
        CourseAuthor input = authorWithUserId(5);
        when(userRepository.findById(5))
                .thenReturn(Optional.of(userWithRoleKey(5, RoleKey.STUDENT)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.create(input));
        assertEquals(
                "Kursa autors/mācībspēks var būt tikai lietotājs ar vismaz Pasniedzēja lomu.",
                ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void create_userWithTeacherRole_isAccepted_andSaved() {
        CourseAuthor input = authorWithUserId(7);
        when(userRepository.findById(7))
                .thenReturn(Optional.of(userWithRoleKey(7, RoleKey.TEACHER)));
        when(repository.save(input)).thenReturn(input);

        CourseAuthor saved = service.create(input);
        assertSame(input, saved);
        verify(repository).save(input);
    }

    @Test
    void create_userWithAdminRole_isAccepted_byCumulativeRights() {
        CourseAuthor input = authorWithUserId(17);
        when(userRepository.findById(17))
                .thenReturn(Optional.of(userWithRoleKey(17, RoleKey.ADMIN)));
        when(repository.save(input)).thenReturn(input);

        CourseAuthor saved = service.create(input);
        assertSame(input, saved);
        verify(repository).save(input);
    }

    @Test
    void create_userWithoutAnyRole_isRejected() {
        CourseAuthor input = authorWithUserId(99);
        User userNoRole = new User();
        userNoRole.setId(99);
        userNoRole.setRole(null);
        when(userRepository.findById(99)).thenReturn(Optional.of(userNoRole));

        assertThrows(IllegalArgumentException.class, () -> service.create(input));
        verify(repository, never()).save(any());
    }
}
