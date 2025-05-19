package lv.venta.coursecatalog.model.courseinfo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.user.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "course_info")
public class CourseInfo {

    @Id
    @GeneratedValue
    private UUID id;

    // Saite uz pamata kursu (Course)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Saite uz konkrēto versiju (CourseVersion)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id", nullable = false)
    private CourseVersion courseVersion;

    // Kopējais akadēmisko stundu skaits (kontaktstundas)
    @Column(name = "academic_hours_total", nullable = false)
    private int academicHoursTotal;

    // Lekciju stundu skaits
    @Column(name = "lecture_hours")
    private Integer lectureHours;

    // Praktisko nodarbību stundu skaits
    @Column(name = "pract_classes_hours")
    private Integer practClassesHours;

    // Patstāvīgā darba stundu skaits (obligāts)
    @Column(name = "independent_work_hours", nullable = false)
    private int independentWorkHours;

    // Apraksts par nepieciešamajām priekšzināšanām
    @Column(name = "prerequisites_description", columnDefinition = "TEXT")
    private String prerequisitesDescription;

    // Studiju kursa mērķis
    @Column(name = "goal", columnDefinition = "TEXT")
    private String goal;

    // Anotācija
    @Column(name = "annotation", columnDefinition = "TEXT")
    private String annotation;

    // Pārbaudes formas ID – izvēles relācija
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_form_id")
    private AssessmentForm assessmentForm;

    // Valoda ('lv', 'en')
    @Column(name = "language", nullable = false)
    private String language;

    // Izveides datums
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Atjaunošanas datums
    private LocalDateTime updatedAt;

    // Autors (izveidotājs)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Redaktors (atjauninātājs)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // Mīkstā dzēšana (soft delete)
    private LocalDateTime deletedAt;

    //sasaiste ar CoursePrerequisites
    @OneToMany(mappedBy = "courseInfo", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<CoursePrerequisites> prerequisites;
}
