package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseToStudyProgramsService {

    @Autowired
    private CourseToStudyProgramsRepository repository;

    public List<CourseToStudyPrograms> getAll() {
        return repository.findAll();
    }

    public CourseToStudyPrograms create(CourseToStudyPrograms input) {
        return repository.save(input);
    }

    public CourseToStudyPrograms update(int id, CourseToStudyPrograms input) throws Exception {
        CourseToStudyPrograms existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Sasaistes ieraksts nav atrasts pēc ID = " + id));
        existing.setCourse(input.getCourse());
        existing.setProgram(input.getProgram());
        existing.setProgramPart(input.getProgramPart());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
