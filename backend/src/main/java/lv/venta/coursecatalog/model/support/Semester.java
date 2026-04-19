package lv.venta.coursecatalog.model.support;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.util.List;

/**
 * Entītija, kas apzīmē semestri – piemēram, "Rudens", "Pavasara".
 */
@Entity
@Table(name = "semesters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Semestra nosaukums (piemēram, "Rudens").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Kursa versijas, kuras attiecināmas uz šo semestri.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "semester", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> courseVersions;
}
