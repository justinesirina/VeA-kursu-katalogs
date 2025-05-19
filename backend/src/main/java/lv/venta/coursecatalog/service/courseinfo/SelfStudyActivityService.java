package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.SelfStudyActivity;
import lv.venta.coursecatalog.repository.courseinfo.SelfStudyActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SelfStudyActivityService {

    @Autowired
    private SelfStudyActivityRepository activityRepo;

    public List<SelfStudyActivity> getAll() {
        return activityRepo.findAll();
    }

    public SelfStudyActivity getById(int id) {
        return activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta aktivitāte ar id = " + id));
    }

    @Transactional
    public SelfStudyActivity create(SelfStudyActivity activity) {
        return activityRepo.save(activity);
    }

    @Transactional
    public SelfStudyActivity update(int id, SelfStudyActivity updated) {
        SelfStudyActivity existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return activityRepo.save(existing);
    }

    @Transactional
    public void delete(int id) {
        if (!activityRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā aktivitāte ar id = " + id);
        }
        activityRepo.deleteById(id);
    }
}
