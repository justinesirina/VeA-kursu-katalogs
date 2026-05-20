package lv.venta.coursecatalog.model.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
     * Fiksēts lomas identifikators autorizācijai. Atšķirībā no roleName,
     * šī vērtība nemainās un to lieto Spring Security pārbaudēs.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role_key", nullable = false, unique = true, length = 32)
    private RoleKey roleKey;

    /**
     * Visi lietotāji, kuriem piešķirta šī loma.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<User> users;

    public String getRoleName() {
        return roleName;
    }
}


