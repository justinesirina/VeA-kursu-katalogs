package lv.venta.coursecatalog.model.course;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.support.AcademicYear;
import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.model.support.Semester;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entītija, kas reprezentē vienu konkrētu studiju kursa apraksta versiju.
 * Šī versija satur metadatus par izveidošanas laiku, statusu, semestri,
 * apstiprināšanu un sasaisti ar pamata studiju kursu (Course).
 */
@Entity
@Table(name = "course_versions")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CourseVersion {

    @Id
    @GeneratedValue
    private UUID id;

    /**
     * Atsauce uz pamata studiju kursu, kuram šī ir viena no versijām.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;

    /**
     * Versijas numurs – piemēram, 1, 2, 3 utt.
     */
    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    /**
     * Atsauce uz statusa entītiju, kas norāda versijas stāvokli – piemēram, "sagatavē" vai "apstiprināta".
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    @JsonIgnoreProperties({"courseVersions"})
    private VersionStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Kurš lietotājs izveidoja šo versiju.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = true)
    @JsonIgnoreProperties({"createdCourseVersions", "updatedCourseVersions"})
    private User createdBy;

    /**
     * Kurš pēdējoreiz atjaunoja šo versiju.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "updated_by", nullable = true)
    @JsonIgnoreProperties({"createdCourseVersions", "updatedCourseVersions"})
    private User updatedBy;

    @Column(name = "is_archived", nullable = false)
    private boolean isArchived = false;

    @JsonProperty("active")
    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    /**
     * Saite ar fakultāti, kas atbild par kursa versijas īstenošanu.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = true)
    private Faculty faculty;

    /**
     * Atsauce uz akadēmisko gadu, kurā šī kursa versija ir spēkā.
     * Nullable — jaunas Melnraksts versijas tiek izveidotas bez piesaistes konkrētam gadam;
     * apstiprinātājs piesaista versiju gadam tikai pirms apstiprināšanas.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id")
    @JsonIgnoreProperties({"courseVersions"})
    private AcademicYear academicYear;

    /**
     * Atsauce uz semestri – rudens, pavasara u.c.
     * Nullable tāpat kā academicYear.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id")
    @JsonIgnoreProperties({"courseVersions"})
    private Semester semester;

    /**
     * Datums, kad versija apstiprināta (ja tāda ir).
     */
    @Column(name = "approval_date")
    private LocalDate approvalDate;

    /**
     * Apstiprināšanas dokumenta numurs. Piemēram, Nr. 22-04-12
     */
    @Column(name = "decision_number")
    private String decisionNumber;

    /**
     * Papildu atsauce vai piezīme par apstiprināšanas dokumentu. Piemēram, Senāta vai ITF domes lēmums.
     */
    @Column(name = "decision_reference")
    private String decisionReference;

    /**
     * Mīkstā dzēšana – datums, kad šī versija ir atzīmēta kā dzēsta.
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
