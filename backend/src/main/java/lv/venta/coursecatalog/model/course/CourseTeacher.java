package lv.venta.coursecatalog.model.course;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;

import java.io.Serializable;

/**
 * Entītija, kas attēlo kursa docētāju piesaisti konkrētai versijai.
 * Sasaiste ir versionēta — katra CourseVersion var saturēt savu docētāju sarakstu.
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
     * Kursa versija, kuram piesaistīts docētājs.
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id", nullable = false)
    private CourseVersion courseVersion;

    /**
     * Lietotājs, kurš ir kursa docētājs.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Docētāja loma: piemēram, "Atbildīgais mācībspēks", "Mācībspēks".
     */
    private String role;
}
