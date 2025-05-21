package lv.venta.coursecatalog.model.support;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

/**
 * Entītija, kas attēlo studiju līmeņus augstākajā izglītībā
 * (piemēram, Bakalaura, Maģistra).
 */
@Entity
@Table(name = "study_levels")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class StudyLevel implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju līmeņa nosaukums, piemēram: "Bakalaura"
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Papildu skaidrojums vai apraksts (nav obligāts).
     */
    @Column(columnDefinition = "TEXT")
    private String description;
}
