package lv.venta.coursecatalog.service.log;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.dto.CourseVersionLogDTO;
import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.log.CourseVersionActionRepository;
import lv.venta.coursecatalog.repository.log.CourseVersionLogRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Serviss kursa versiju žurnāla ierakstu apstrādei.
 */
@Service
public class CourseVersionLogService {

    @Autowired
    private CourseVersionLogRepository repository;

    @Autowired
    private CourseVersionActionRepository actionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CourseVersionLog> getAll() {
        return repository.findAll();
    }

    /**
     * F9 — atgriež plakanu žurnāla projekciju, sakārtotu pēc laika dilstoši.
     */
    public List<CourseVersionLogDTO> getAllAsDTO() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(
                        CourseVersionLog::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(CourseVersionLogDTO::from)
                .toList();
    }

    public CourseVersionLog create(CourseVersionLog input) {
        return repository.save(input);
    }

    public CourseVersionLog update(int id, CourseVersionLog input) throws Exception {
        CourseVersionLog existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Žurnāla ieraksts nav atrasts pēc ID = " + id));
        existing.setCourseVersion(input.getCourseVersion());
        existing.setUser(input.getUser());
        existing.setAction(input.getAction());
        existing.setComment(input.getComment());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }

    /**
     * F9 — universāls palīgs žurnāla ieraksta pievienošanai. Izmanto gan F8
     * apstiprināšanas plūsma, gan jaunie kursa darbību hooks (izveide,
     * arhivēšana, atjaunošana, neatgriezeniska dzēšana).
     *
     * <p>Klusi atgriežas (bez kļūdas), ja darbības kods nav atrasts vai
     * lietotājs nav atrasts — žurnālam nevajadzētu bloķēt biznesa darbību.</p>
     *
     * @param course        kurss (vienmēr obligāts; ja null, ieraksts netiek izveidots)
     * @param version       versija (var būt null kursa līmeņa darbībām)
     * @param actorUserId   lietotāja id, kas veica darbību (var būt null — anonīma darbība)
     * @param actionCode    darbības kods no course_version_actions tabulas
     * @param comment       brīvā teksta komentārs (var būt null)
     */
    public void append(Course course, CourseVersion version, Integer actorUserId,
                       String actionCode, String comment) {
        if (course == null || actionCode == null) return;
        CourseVersionAction action = actionRepository.findByCode(actionCode).orElse(null);
        if (action == null) return;

        User user = null;
        if (actorUserId != null) {
            user = userRepository.findById(actorUserId).orElse(null);
        }

        CourseVersionLog entry = new CourseVersionLog();
        entry.setCourse(course);
        entry.setCourseVersion(version);
        entry.setUser(user);
        entry.setAction(action);
        entry.setComment(comment != null && !comment.isBlank() ? comment.trim() : null);
        entry.setCreatedAt(LocalDateTime.now());
        repository.save(entry);
    }
}
