package lv.venta.coursecatalog.model.literature;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lv.venta.coursecatalog.model.CourseInfo;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"courseInfo"}) // izvairāmies no problēmām ar LAZY un cikliem
@Entity
@Table(name = "literature_sources")
public class LiteratureSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Piesaistītais studiju kursa saturs (CourseInfo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_info_id", nullable = false)
    @JsonIgnore
    private CourseInfo courseInfo;

    // Literatūras veids (piemēram, Pamatliteratūra)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_id", nullable = false)
    private LiteratureType type;

    // Bibliogrāfiskā atsauce obligāta
    @NotBlank(message = "Literatūras ieraksts nedrīkst būt tukšs")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String citation;

    // Hipersaite uz avotu (neobligāts lauks, bet ja aizpildīts – validējam formātu)
    @Pattern(
            regexp = "^(https?://).+",
            message = "Nederīgs URL – jābūt formātam, sākot ar https://"
    )
    private String url;

    // Valodas kods – tikai 'lv' vai 'en'
    @Pattern(regexp = "^(lv|en)$", message = "Valodai jābūt 'lv' vai 'en'")
    @Column(nullable = false)
    private String language;

    // Izveides un atjaunināšanas laiki
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
