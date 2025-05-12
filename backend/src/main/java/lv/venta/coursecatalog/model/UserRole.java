package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Entītija, kas pārstāv lietotāja lomu sistēmā.
 * Piemēri: "Administrators", "Pasniedzējs", "Studējošais" u.c.
 */
@Entity
@Table(name = "user_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Lomas nosaukums (piemēram, "Lecturer", "Admin").
     */
    @Column(nullable = false, unique = true)
    private String roleName;

    /**
     * Visi lietotāji, kuriem piešķirta šī loma.
     */
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<User> users;
}
