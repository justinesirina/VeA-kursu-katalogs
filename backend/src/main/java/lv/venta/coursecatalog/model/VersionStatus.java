package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Entītija, kas reprezentē kursa versijas statusu.
 * Piemēri: "Sagatavē", "Apstiprināta", "Arhivēta" u.c.
 */
@Entity
@Table(name = "version_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VersionStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Statusa nosaukums (piemēram, "Apstiprināta").
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Apraksts vai papildu paskaidrojums par statusa nozīmi.
     */
    private String description;

    /**
     * Kursu versijas, kurām šis statuss ir piemērots.
     */
    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> courseVersions;
}
