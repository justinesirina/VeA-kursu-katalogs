package lv.venta.coursecatalog.model.support;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

/**
 * Entītija, kas attēlo studiju formas — piemēram, pilna laika vai nepilna laika studijas.
 */
@Entity
@Table(name = "study_forms")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class StudyForm implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju formas nosaukums, piemēram: "Pilna laika".
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Papildu skaidrojums vai apraksts (nav obligāts).
     */
    @Column(columnDefinition = "TEXT")
    private String description;
}
