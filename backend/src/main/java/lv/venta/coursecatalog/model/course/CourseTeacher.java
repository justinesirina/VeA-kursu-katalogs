package lv.venta.coursecatalog.model.course;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;

import java.io.Serializable;

/**
 * Entītija, kas attēlo kursa docētāju piesaisti ar norādi uz lietotāju un lomu.
 */
@Entity
@Table(name = "course_teachers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseTeacher implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju kurss, kuram piesaistīts docētājs.
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Lietotājs, kurš ir kursa docētājs.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Docētāja loma: piemēram, "vadītājs", "asistents".
     */
    private String role;
}
