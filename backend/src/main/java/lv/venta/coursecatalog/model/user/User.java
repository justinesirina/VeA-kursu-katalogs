package lv.venta.coursecatalog.model.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.course.CourseVersion;
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

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

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
     * Lietotāja zinātniskais grāds, piemēram: “Mg.sc.comp.”.
     */
    @Column(name = "academic_degree")
    private String academicDegree;

    /**
     * Lietotāja amats vai akadēmiskā pozīcija, piemēram, lektors, dekāns.
     */
    @Column(name = "position")
    private String position;

    /**
     * Lietotāja loma sistēmā (atsauce uz user_roles).
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnoreProperties({"users"})
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
    @JsonIgnore
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> createdCourseVersions;

    /**
     * Kursa versijas, ko šis lietotājs ir atjaunojis.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "updatedBy", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<CourseVersion> updatedCourseVersions;
}

