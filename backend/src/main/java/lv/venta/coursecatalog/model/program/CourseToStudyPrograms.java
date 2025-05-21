package lv.venta.coursecatalog.model.program;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.program.StudyProgram;

import java.io.Serializable;

/**
 * Entītija, kas attēlo daudz-pret-daudz (n:m) attiecību starp kursiem un studiju programmām.
 */
@Entity
@Table(name = "course_to_study_programs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseToStudyPrograms implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju kurss, kas ir piesaistīts studiju programmai.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Course course;

    /**
     * Studiju programma, kurai piesaistīts kurss.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyProgram program;
}
