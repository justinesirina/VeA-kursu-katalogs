package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entītija, kas pārstāv sistēmas lietotāju (piemēram, pasniedzēju, metodiķi, administratoru).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Lietotāja vārds un uzvārds.
     */
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    /**
     * Lietotāja e-pasta adrese – unikāla identifikācija sistēmā.
     */
    @Column(unique = true)
    private String email;

    /**
     * Lietotāja loma sistēmā (atsauce uz user_roles).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private UserRole role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Kursa versijas, ko šis lietotājs ir izveidojis.
     */
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> createdCourseVersions;

    /**
     * Kursa versijas, ko šis lietotājs ir atjaunojis.
     */
    @OneToMany(mappedBy = "updatedBy", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> updatedCourseVersions;
}
