package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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
    private VersionStatus status;

    /**
     * Īsais un URL-draudzīgais identifikators šai versijai.
     */
    @Column(name = "slug", unique = true)
    private String slug;

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
    private User createdBy;

    /**
     * Kurš pēdējoreiz atjaunoja šo versiju.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "updated_by", nullable = true)
    private User updatedBy;

    @Column(name = "is_archived", nullable = false)
    private boolean isArchived = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    /**
     * Atsauce uz akadēmisko gadu, kurā šī kursa versija ir spēkā.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    /**
     * Atsauce uz semestri – rudens, pavasara u.c.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id", nullable = false)
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
