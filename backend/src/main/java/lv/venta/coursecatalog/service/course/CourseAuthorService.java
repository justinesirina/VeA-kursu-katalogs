package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.user.RoleKey;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import lv.venta.coursecatalog.service.security.RoleHierarchy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Serviss kursa autoru apstrādei.
 */
@Service
public class CourseAuthorService {

    @Autowired
    private CourseAuthorRepository repository;

    @Autowired
    private UserRepository userRepository;

    public List<CourseAuthor> getAll() {
        return repository.findAll();
    }

    public List<CourseAuthor> getByCourseVersionId(UUID courseVersionId) {
        return repository.findByCourseVersionId(courseVersionId);
    }

    public CourseAuthor create(CourseAuthor input) {
        validateUserHasTeacherRole(input);
        return repository.save(input);
    }

    public CourseAuthor update(int id, CourseAuthor input) throws Exception {
        CourseAuthor existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Autora ieraksts nav atrasts pēc ID = " + id));
        validateUserHasTeacherRole(input);
        existing.setCourseVersion(input.getCourseVersion());
        existing.setUser(input.getUser());
        existing.setRole(input.getRole());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }

    /**
     * F1 datu integritātes pārbaude: kursa autoram/mācībspēkam jābūt vismaz Pasniedzēja lomai
     * (atbilstoši kumulatīvo tiesību principam, ieskaitot Programmas direktoru, Administratoru
     * un Sistēmas administratoru). Aizsargā API līmenī, ne tikai UI filtru.
     */
    private void validateUserHasTeacherRole(CourseAuthor input) {
        if (input == null || input.getUser() == null) {
            throw new IllegalArgumentException("Kursa autoram/mācībspēkam jānorāda lietotājs.");
        }
        User user = userRepository.findById(input.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Norādītais lietotājs nav atrasts sistēmā."));
        RoleKey roleKey = user.getRole() != null ? user.getRole().getRoleKey() : null;
        if (!RoleHierarchy.hasRoleAtLeast(roleKey, RoleKey.TEACHER)) {
            throw new IllegalArgumentException(
                    "Kursa autors/mācībspēks var būt tikai lietotājs ar vismaz Pasniedzēja lomu.");
        }
    }
}
