package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "assessment_components")
public class AssessmentComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Vērtēšanas metodes nosaukums, piemēram: "Eksāmens", "Studiju darbs"
    @NotBlank(message = "Komponentes nosaukums nedrīkst būt tukšs")
    @Column(nullable = false, unique = true)
    private String name;

    // Papildu apraksts, ja nepieciešams
    @Column(columnDefinition = "TEXT")
    private String description;
}
