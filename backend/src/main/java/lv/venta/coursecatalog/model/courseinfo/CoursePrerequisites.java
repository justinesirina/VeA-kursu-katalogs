package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.Course;
import lv.venta.coursecatalog.model.CourseInfo;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "course_prerequisites")
public class CoursePrerequisites {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Kursa versijas saturs, kuram piesaista šo priekšnosacījumu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_info_id", nullable = false)
    private CourseInfo courseInfo;

    // Kurš cits kurss ir nepieciešams kā priekšnosacījums
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "required_course_id", nullable = false)
    private Course requiredCourse;

    // Priekšnosacījuma tips: required / recommended u.c.
    @Column
    private String type;
}
