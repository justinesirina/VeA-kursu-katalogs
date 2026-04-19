package lv.venta.coursecatalog.model.program;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Studiju programmas daļa — piem., "A - Obligātā", "B - Ierobežotās izvēles", "C - Brīvās izvēles".
 * Lookup tabula, ko administrators pārvalda ar CRUD admin UI.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "study_program_parts")
public class StudyProgramPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Programmas daļas nosaukums nedrīkst būt tukšs")
    @Column(nullable = false, unique = true)
    private String name;

    // Nosaukums angļu valodā (nullable — var pievienot vēlāk)
    @Column(name = "name_en")
    private String nameEn;

    @Column(columnDefinition = "TEXT")
    private String description;
}
