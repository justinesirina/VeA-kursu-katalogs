package lv.venta.coursecatalog.model.program;

import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.courseinfo.CourseResult;

@Entity
@Table(name = "course_to_programme_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CourseToProgrammeResults {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_info_id")
    private CourseInfo courseInfo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_result_id")
    private CourseResult courseResult;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_result_id")
    private ProgrammeResult programmeResult;

    // Papildu atribūti nākotnē: importance_level, comment utt.
}
