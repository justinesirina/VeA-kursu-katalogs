package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseSelfStudyDistribution;
import lv.venta.coursecatalog.repository.courseinfo.CourseSelfStudyDistributionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseSelfStudyDistributionService {

    @Autowired
    private CourseSelfStudyDistributionRepository distRepo;

    public List<CourseSelfStudyDistribution> getAll() {
        return distRepo.findAll();
    }

    public CourseSelfStudyDistribution getById(int id) {
        return distRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts sadalījums ar id = " + id));
    }

    @Transactional
    public CourseSelfStudyDistribution create(CourseSelfStudyDistribution dist) {
        return distRepo.save(dist);
    }

    @Transactional
    public CourseSelfStudyDistribution update(int id, CourseSelfStudyDistribution updated) {
        CourseSelfStudyDistribution existing = getById(id);
        existing.setCourseInfo(updated.getCourseInfo());
        existing.setActivity(updated.getActivity());
        existing.setPercentage(updated.getPercentage());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return distRepo.save(existing);
    }

    @Transactional
    public void delete(int id) {
        if (!distRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais ieraksts ar id = " + id);
        }
        distRepo.deleteById(id);
    }
}
