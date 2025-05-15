package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "results_categories")
public class ResultsCategory {

    @Id
    private UUID id;

    @NotBlank(message = "Kategorijas nosaukums nedrīkst būt tukšs")
    @Column(nullable = false, unique = true)
    private String name;
}

