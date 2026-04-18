package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"courseInfo"})
@Entity
@Table(name = "course_assessment_distribution")
public class CourseAssessmentDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Saite uz kursa saturu (CourseInfo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_info_id", nullable = false)
    private CourseInfo courseInfo;

    // Saite uz vērtēšanas komponenti (Eksāmens, Projekts utt.)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id", nullable = false)
    private AssessmentComponent component;

    // Komponentes īpatsvars procentos (validējam robežās)
    @Min(value = 0, message = "Procentuālā vērtība nevar būt mazāka par 0%")
    @Max(value = 100, message = "Procentuālā vērtība nevar pārsniegt 100%")
    @Column(nullable = false)
    private int percentage;

    // Secība rādīšanai (0-based)
    @Column(name = "display_order", nullable = false)
    @ColumnDefault("0")
    private int displayOrder = 0;

    // Izveides un atjaunošanas datumi
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    // Metadati: kurš lietotājs izveidoja/rediģēja
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
