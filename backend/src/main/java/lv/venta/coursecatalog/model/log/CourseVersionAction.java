package lv.venta.coursecatalog.model.log;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * Atsauču entītija, kas nosaka kursa versijas darbību tipus (piemēram: "create", "approve").
 */
@Entity
@Table(name = "course_version_actions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseVersionAction implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Darbības kods, piemēram: "create", "update", "approve".
     */
    @Column(nullable = false, unique = true)
    private String code;

    /**
     * Cilvēklasāms nosaukums, piemēram: "Izveide", "Apstiprināšana".
     */
    private String label;

    /**
     * Papildu apraksts vai skaidrojums (nav obligāts).
     */
    @Column(columnDefinition = "TEXT")
    private String description;
}
