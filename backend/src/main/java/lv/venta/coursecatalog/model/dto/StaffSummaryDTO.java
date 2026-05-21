package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Publicējams mācībspēka kopsavilkums F5 kataloga autora/pasniedzēja filtru sarakstam.
 * Satur tikai tos laukus, kas drīkst būt publiski redzami autentificētiem lietotājiem
 * (ieskaitot Studentu) — bez e-pasta vai citiem sensitīviem datiem.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffSummaryDTO {
    private int id;
    private String name;
    private String surname;
    private String position;
    private String academicDegree;
    private String roleKey;
    private String roleName;
}
