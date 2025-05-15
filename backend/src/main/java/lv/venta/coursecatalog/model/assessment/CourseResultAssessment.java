package lv.venta.coursecatalog.model.assessment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lv.venta.coursecatalog.model.courseinfo.CourseResult;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "course_result_assessments")
public class CourseResultAssessment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Kursa rezultāts, kuram piesaista vērtēšanas komponenti
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_result_id", nullable = false)
    private CourseResult courseResult;

    // Vērtēšanas komponente, kas tiek izmantota (piemēram, "Eksāmens")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id", nullable = false)
    private AssessmentComponent component;

    // Vai konkrētā komponente tiek izmantota šī rezultāta vērtēšanā
    @NotNull
    @Column(nullable = false)
    private boolean isUsed = false;
}
