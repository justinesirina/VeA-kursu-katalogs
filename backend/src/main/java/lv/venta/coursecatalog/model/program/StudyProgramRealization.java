package lv.venta.coursecatalog.model.program;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.support.*;

import java.io.Serializable;

/**
 * Entītija, kas attēlo studiju programmas realizāciju konkrētā valodā, formā un līmenī.
 */
@Entity
@Table(name = "study_program_realizations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class StudyProgramRealization implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Studiju programma, uz kuru attiecas šī realizācija.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyProgram program;

    /**
     * Studiju valoda, piemēram: "lv" vai "en".
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Language language;

    /**
     * Studiju forma: pilna vai nepilna laika.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_form_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyForm studyForm;

    /**
     * Studiju līmenis: bakalaura, maģistra utt.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyLevel level;

    /**
     * Programmas ilgums gados.
     */
    private int durationYears;

    /**
     * Kopējais kredītpunktu apjoms.
     */
    private int credits;

    /**
     * Piešķiramā kvalifikācija.
     */
    private String qualification;

    /**
     * Piešķiramais grāds.
     */
    private String degree;

    /**
     * Vai realizācija ir aktīva.
     */
    @Column(nullable = false)
    private boolean isActive = true;
}
