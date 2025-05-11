package lv.venta.coursecatalog.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entītija, kas pārstāv studiju kursu pamatinformāciju.
 * Tabula satur unikālu identifikatoru, nosaukumus vairākās valodās, statusa laukus un datumu metadatus.
 */
@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class Course {

    /**
     * Universāli unikāls identifikators, ko ģenerē sistēma.
     */
    @Id
    @GeneratedValue
    private UUID id;

    /**
     * Studiju kursa LAIS kods (piemēram, "IT101").
     */
    @Column(name = "course_code", nullable = false, unique = true)
    private String courseCode;

    /**
     * Studiju kursa nosaukums latviešu valodā.
     */
    @Column(name = "title_lv", nullable = false)
    private String titleLv;

    /**
     * Studiju kursa nosaukums angļu valodā.
     */
    @Column(name = "title_en", nullable = false)
    private String titleEn;

    /**
     * Īsais nosaukums vai URL-draudzīgs identifikators.
     */
    @Column(unique = true)
    private String slug;

    /**
     * Kursa kredītpunktu apjoms.
     */
    @Column(nullable = false)
    private int credits;

    /**
     * Automātiski iestata izveides laiku.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Automātiski atjaunina pēdējo izmaiņu laiku.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Norāda, vai kurss ir arhivēts.
     */
    @Column(name = "is_archived", nullable = false)
    private boolean archived = false;

    /**
     * Norāda, vai kurss ir aktīvs sistēmā.
     */
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    /**
     * Kurss ir dzēsts (soft delete pieeja).
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
