package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Entītija, kas apzīmē akadēmisko gadu (piemēram, "2024/2025").
 */
@Entity
@Table(name = "academic_years")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AcademicYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Akadēmiskā gada nosaukums, piemēram "2024/2025".
     */
    @Column(nullable = false, unique = true)
    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    /**
     * Kursu versijas, kas attiecināmas uz šo akadēmisko gadu.
     */
    @OneToMany(mappedBy = "academicYear", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> courseVersions;
}
