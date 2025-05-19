package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseInfoRepository extends JpaRepository<CourseInfo, UUID> {
    // Šeit vari vēlāk pievienot pielāgotas meklēšanas metodes
}
