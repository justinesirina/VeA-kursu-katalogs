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
@Table(name = "results_categories")
public class ResultsCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Kategorijas nosaukums nedrīkst būt tukšs")
    @Column(nullable = false, unique = true)
    private String name;
}

