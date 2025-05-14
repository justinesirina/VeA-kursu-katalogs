package lv.venta.coursecatalog.model.assessment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "assessment_forms")
public class AssessmentForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Piemēram: "Eksāmens", "Ieskaite"
    @NotBlank(message = "Nosaukums nedrīkst būt tukšs")
    @Column(nullable = false, unique = true)
    private String name;

    // Papildus skaidrojums, ja nepieciešams
    @Column(columnDefinition = "TEXT")
    private String description;
}
