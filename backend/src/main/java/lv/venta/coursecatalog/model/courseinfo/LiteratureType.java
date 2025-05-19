package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "literature_types")
public class LiteratureType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Literatūras veida nosaukums, piemēram: "Pamatliteratūra", "Papildu literatūra"
    @Column(nullable = false, unique = true)
    private String name;

    // Apraksts (nav obligāts, bet var noderēt nākotnē)
    @Column(columnDefinition = "TEXT")
    private String description;
}
