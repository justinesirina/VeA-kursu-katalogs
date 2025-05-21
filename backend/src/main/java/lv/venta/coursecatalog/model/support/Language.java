package lv.venta.coursecatalog.model.support;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

/**
 * Entītija, kas attēlo studiju valodas — piemēram, "Latviešu", "Angļu".
 */
@Entity
@Table(name = "languages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Language implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Valodas pilnais nosaukums, piemēram, "Latviešu valoda" vai "English".
     */
    @Column(nullable = false)
    private String name;

    /**
     * Valodas ISO kods, piemēram, "lv" vai "en".
     */
    @Column(nullable = false, unique = true)
    private String code;
}
