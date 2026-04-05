package lv.venta.coursecatalog.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;

import java.io.Serializable;

/**
 * Entītija, kas attēlo kursa autoru piesaisti ar norādi uz lietotāju un lomu.
 */
@Entity
@Table(name = "course_authors")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseAuthor implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju kurss, kuram piesaistīts autors.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Lietotājs, kurš ir kursa autors.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "$$_hibernate_interceptor"})
    private User user;

    /**
     * Autora loma: piemēram, "galvenais", "līdzautors".
     */
    private String role;
}
