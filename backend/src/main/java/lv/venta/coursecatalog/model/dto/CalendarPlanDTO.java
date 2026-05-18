package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase, kas attēlo kalendāro plānu vienai tēmai,
 * t.i., kādas nodarbības notiek, ar kādu stundu apjomu.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarPlanDTO {

    // CalendarTopic ID rediģēšanai/dzēšanai
    private int calendarTopicId;

    // Tēmas nosaukums, kurai šis plāns pieder
    private String topicTitle;

    // CourseContent ID — saite uz tēmu no Tēmas sadaļas
    private int courseContentId;

    // Secības numurs kalendārajā plānā (ļauj pasniedzējam mainīt tēmu secību)
    private int sequenceNumber;

    // Nodarbības, kas saistītas ar šo tēmu (lekcijas, semināri u.c.)
    private List<SessionDTO> sessions;

    /**
     * Atgriež akadēmisko stundu summu visās šīs tēmas nodarbībās.
     * Iegūts no {@code sessions} lauka — derīgs visiem skatiem un eksportiem,
     * neatkarīgi no izteiksmjes.
     */
    public int getTotalAcademicHours() {
        if (sessions == null) return 0;
        int sum = 0;
        for (SessionDTO s : sessions) sum += s.getAcademicHours();
        return sum;
    }
}
