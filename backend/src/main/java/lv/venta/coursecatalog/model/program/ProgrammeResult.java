package lv.venta.coursecatalog.model.program;

import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.program.StudyProgram;
import lv.venta.coursecatalog.model.courseinfo.ResultsCategory;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "programme_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProgrammeResult {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_program_id")
    private StudyProgram studyProgram;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private ResultsCategory category;

    @Column(nullable = false)
    private String language; // Piemēram, 'lv' vai 'en'

    @Column(name = "learning_outcome", nullable = false)
    private String learningOutcome;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
